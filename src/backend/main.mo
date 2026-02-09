import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

actor {
  // === Types ===

  public type UserProfile = {
    // Private profile fields (visible only to owner and admin)
    fullName : Text;
    email : Text;
    phone : Text;
    address : Text;
    dateOfBirth : Text;
    // Metadata
    registrationComplete : Bool;
    onboardingComplete : Bool;
    profileComplete : Bool;
    points : Nat;
  };

  type PublicProfile = {
    principal : Principal;
    biography : Text;
    companyName : Text;
    website : Text;
    socialLinks : Text;
    servicesOffered : Text;
    validated : Bool;
    eventsAttended : Nat;
  };

  type Event = {
    id : Nat;
    title : Text;
    description : Text;
    date : Text;
    location : Text;
    rsvpCount : Nat;
    notAttendingCount : Nat;
  };

  type ChatMessage = {
    id : Nat;
    author : Principal;
    content : Text;
    approved : Bool;
    timestamp : Int;
    votes : Int;
  };

  module Event {
    public func compareByRSVPCount(event1 : Event, event2 : Event) : Order.Order {
      Nat.compare(event2.rsvpCount, event1.rsvpCount);
    };
  };

  // === State ===
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let publicProfiles = Map.empty<Principal, PublicProfile>();
  let rsvps = Map.empty<Principal, Map.Map<Nat, Bool>>();
  let events = Map.empty<Nat, Event>();
  var eventIdCounter = 0;
  let chatMessages = Map.empty<Nat, ChatMessage>();
  var messageIdCounter = 0;
  let messageVotes = Map.empty<Principal, Set.Set<Nat>>(); // Track which messages each user voted on
  let registrationBonusAwarded = Set.empty<Principal>();
  let profileCompleteBonusAwarded = Set.empty<Principal>();
  let validationBonusAwarded = Set.empty<Principal>();

  // === Helper Functions ===

  func isProfileComplete(profile : UserProfile) : Bool {
    profile.fullName != "" and 
    profile.email != "" and 
    profile.phone != "" and 
    profile.address != "" and 
    profile.dateOfBirth != "";
  };

  func requireOnboardingComplete(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (not profile.onboardingComplete) {
          Runtime.trap("Unauthorized: Onboarding must be completed to access this feature");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User must be registered");
      };
    };
  };

  func requireRegistered(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access this feature");
    };
    if (not userProfiles.containsKey(caller)) {
      Runtime.trap("Unauthorized: User must be registered");
    };
  };

  // === Approval Methods ===

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // === User Registration and Profile Methods ===

  public shared ({ caller }) func registerUser() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let newProfile : UserProfile = {
      fullName = "";
      email = "";
      phone = "";
      address = "";
      dateOfBirth = "";
      registrationComplete = true;
      onboardingComplete = false;
      profileComplete = false;
      points = 100; // Award 100 points for registration
    };

    userProfiles.add(caller, newProfile);
    registrationBonusAwarded.add(caller);
  };

  public shared ({ caller }) func completeOnboarding() : async () {
    requireRegistered(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.onboardingComplete) {
          Runtime.trap("Onboarding already completed");
        };

        let updatedProfile : UserProfile = {
          fullName = profile.fullName;
          email = profile.email;
          phone = profile.phone;
          address = profile.address;
          dateOfBirth = profile.dateOfBirth;
          registrationComplete = profile.registrationComplete;
          onboardingComplete = true;
          profileComplete = profile.profileComplete;
          points = profile.points;
        };

        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Only owner and admin can view private profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireRegistered(caller);

    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let wasComplete = existingProfile.profileComplete;
        let nowComplete = isProfileComplete(profile);
        
        // Award 500 points exactly once when profile becomes complete
        var bonusPoints = 0;
        if (not wasComplete and nowComplete and not profileCompleteBonusAwarded.contains(caller)) {
          bonusPoints := 500;
          profileCompleteBonusAwarded.add(caller);
        };

        let updatedProfile : UserProfile = {
          fullName = profile.fullName;
          email = profile.email;
          phone = profile.phone;
          address = profile.address;
          dateOfBirth = profile.dateOfBirth;
          registrationComplete = existingProfile.registrationComplete;
          onboardingComplete = existingProfile.onboardingComplete;
          profileComplete = nowComplete;
          points = existingProfile.points + bonusPoints;
        };

        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  // === Public Profile Methods ===

  public query ({ caller }) func getPublicProfile(principal : Principal) : async PublicProfile {
    // Must be logged in and completed onboarding to view public profiles
    requireOnboardingComplete(caller);

    switch (publicProfiles.get(principal)) {
      case (?profile) { 
        // Only show profiles that are validated (admin-approved)
        if (not profile.validated and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Public profile not available");
        };
        profile;
      };
      case (null) { Runtime.trap("Public profile not found") };
    };
  };

  public query ({ caller }) func listPublicProfiles() : async [PublicProfile] {
    // Must be logged in and completed onboarding to view community directory
    requireOnboardingComplete(caller);

    // Only show validated profiles (unless caller is admin)
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    publicProfiles.values().toArray().filter(func(profile) {
      isAdmin or profile.validated
    });
  };

  public shared ({ caller }) func createOrUpdatePublicProfile(profile : PublicProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage public profiles");
    };
    publicProfiles.add(profile.principal, profile);
  };

  public shared ({ caller }) func setProfileValidation(principal : Principal, validated : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can validate profiles");
    };

    switch (publicProfiles.get(principal)) {
      case (?profile) {
        let updatedProfile : PublicProfile = {
          principal = profile.principal;
          biography = profile.biography;
          companyName = profile.companyName;
          website = profile.website;
          socialLinks = profile.socialLinks;
          servicesOffered = profile.servicesOffered;
          validated;
          eventsAttended = profile.eventsAttended;
        };
        publicProfiles.add(principal, updatedProfile);

        // Award 1000 points exactly once when profile is validated
        if (validated and not validationBonusAwarded.contains(principal)) {
          switch (userProfiles.get(principal)) {
            case (?userProfile) {
              let updatedUserProfile : UserProfile = {
                fullName = userProfile.fullName;
                email = userProfile.email;
                phone = userProfile.phone;
                address = userProfile.address;
                dateOfBirth = userProfile.dateOfBirth;
                registrationComplete = userProfile.registrationComplete;
                onboardingComplete = userProfile.onboardingComplete;
                profileComplete = userProfile.profileComplete;
                points = userProfile.points + 1000;
              };
              userProfiles.add(principal, updatedUserProfile);
              validationBonusAwarded.add(principal);
            };
            case (null) { /* User profile doesn't exist, skip bonus */ };
          };
        };
      };
      case (null) { Runtime.trap("Public profile not found") };
    };
  };

  public query ({ caller }) func countValidatedEvents(principal : Principal) : async Nat {
    switch (publicProfiles.get(principal)) {
      case (?profile) { profile.eventsAttended };
      case (null) { Runtime.trap("Public profile not found") };
    };
  };

  // === Event Management Methods ===

  public shared ({ caller }) func createEvent(title : Text, description : Text, date : Text, location : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create events");
    };

    let newEvent : Event = {
      id = eventIdCounter;
      title;
      description;
      date;
      location;
      rsvpCount = 0;
      notAttendingCount = 0;
    };
    events.add(eventIdCounter, newEvent);
    let currentId = eventIdCounter;
    eventIdCounter += 1;
    currentId;
  };

  public shared ({ caller }) func updateEvent(eventId : Nat, title : Text, description : Text, date : Text, location : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update events");
    };

    switch (events.get(eventId)) {
      case (?event) {
        let updatedEvent : Event = {
          id = event.id;
          title;
          description;
          date;
          location;
          rsvpCount = event.rsvpCount;
          notAttendingCount = event.notAttendingCount;
        };
        events.add(eventId, updatedEvent);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public shared ({ caller }) func deleteEvent(eventId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete events");
    };

    events.remove(eventId);
  };

  public shared ({ caller }) func rsvpToEvent(eventId : Nat, attending : Bool) : async () {
    // Only logged-in users who completed onboarding can RSVP
    requireOnboardingComplete(caller);

    switch (events.get(eventId)) {
      case (?event) {
        let userRsvps = switch (rsvps.get(caller)) {
          case (?existingRsvps) { existingRsvps };
          case (null) { Map.empty<Nat, Bool>() };
        };

        if (userRsvps.containsKey(eventId)) {
          Runtime.trap("You have already responded to this event");
        };

        let updatedEvent : Event = if (attending) {
          {
            id = event.id;
            title = event.title;
            description = event.description;
            date = event.date;
            location = event.location;
            rsvpCount = event.rsvpCount + 1;
            notAttendingCount = event.notAttendingCount;
          };
        } else {
          {
            id = event.id;
            title = event.title;
            description = event.description;
            date = event.date;
            location = event.location;
            rsvpCount = event.rsvpCount;
            notAttendingCount = event.notAttendingCount + 1;
          };
        };

        events.add(eventId, updatedEvent);
        userRsvps.add(eventId, attending);
        rsvps.add(caller, userRsvps);
      };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public query ({ caller }) func getEvent(eventId : Nat) : async Event {
    // Must be logged in and completed onboarding to view events
    requireOnboardingComplete(caller);

    switch (events.get(eventId)) {
      case (?event) { event };
      case (null) { Runtime.trap("Event not found") };
    };
  };

  public query ({ caller }) func listEvents() : async [Event] {
    // Must be logged in and completed onboarding to view events
    requireOnboardingComplete(caller);

    events.values().toArray();
  };

  public query ({ caller }) func getPopularEvents() : async [Event] {
    // Must be logged in and completed onboarding to view events
    requireOnboardingComplete(caller);

    events.values().toArray().sort(Event.compareByRSVPCount);
  };

  // === Chat Message Methods ===

  public shared ({ caller }) func postMessage(content : Text) : async Nat {
    // Only logged-in users (not guests/anonymous) can post messages
    requireOnboardingComplete(caller);

    let newMessage : ChatMessage = {
      id = messageIdCounter;
      author = caller;
      content;
      approved = false;
      timestamp = 0;
      votes = 0;
    };
    chatMessages.add(messageIdCounter, newMessage);
    let currentId = messageIdCounter;
    messageIdCounter += 1;

    // Award 50 points for posting a message
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          fullName = profile.fullName;
          email = profile.email;
          phone = profile.phone;
          address = profile.address;
          dateOfBirth = profile.dateOfBirth;
          registrationComplete = profile.registrationComplete;
          onboardingComplete = profile.onboardingComplete;
          profileComplete = profile.profileComplete;
          points = profile.points + 50;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) { /* Should not happen due to requireOnboardingComplete */ };
    };

    currentId;
  };

  public shared ({ caller }) func approveMessage(messageId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve messages");
    };

    switch (chatMessages.get(messageId)) {
      case (?message) {
        let updatedMessage : ChatMessage = {
          id = message.id;
          author = message.author;
          content = message.content;
          approved = true;
          timestamp = message.timestamp;
          votes = message.votes;
        };
        chatMessages.add(messageId, updatedMessage);
      };
      case (null) { Runtime.trap("Message not found") };
    };
  };

  public shared ({ caller }) func removeMessage(messageId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove messages");
    };

    chatMessages.remove(messageId);
  };

  public query ({ caller }) func getApprovedMessages() : async [ChatMessage] {
    // Must be logged in and completed onboarding to view messages
    requireOnboardingComplete(caller);

    chatMessages.values().toArray().filter(func(msg) { msg.approved });
  };

  public query ({ caller }) func getAllMessages() : async [ChatMessage] {
    // Only admin can view all messages (including unapproved)
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all messages");
    };

    chatMessages.values().toArray();
  };

  public shared ({ caller }) func voteMessage(messageId : Nat) : async () {
    // Only logged-in users who completed onboarding can vote
    requireOnboardingComplete(caller);

    switch (chatMessages.get(messageId)) {
      case (?message) {
        if (not message.approved) {
          Runtime.trap("Cannot vote on unapproved message");
        };

        // Check if user already voted on this message
        let userVotes = switch (messageVotes.get(caller)) {
          case (?votes) { votes };
          case (null) { Set.empty<Nat>() };
        };

        if (userVotes.contains(messageId)) {
          Runtime.trap("You have already voted on this message");
        };

        // Update message vote count
        let updatedMessage : ChatMessage = {
          id = message.id;
          author = message.author;
          content = message.content;
          approved = message.approved;
          timestamp = message.timestamp;
          votes = message.votes + 1;
        };
        chatMessages.add(messageId, updatedMessage);

        // Track that user voted on this message
        userVotes.add(messageId);
        messageVotes.add(caller, userVotes);

        // Award 50 points for voting
        switch (userProfiles.get(caller)) {
          case (?profile) {
            let updatedProfile : UserProfile = {
              fullName = profile.fullName;
              email = profile.email;
              phone = profile.phone;
              address = profile.address;
              dateOfBirth = profile.dateOfBirth;
              registrationComplete = profile.registrationComplete;
              onboardingComplete = profile.onboardingComplete;
              profileComplete = profile.profileComplete;
              points = profile.points + 50;
            };
            userProfiles.add(caller, updatedProfile);
          };
          case (null) { /* Should not happen due to requireOnboardingComplete */ };
        };
      };
      case (null) { Runtime.trap("Message not found") };
    };
  };

  // === Points and Leaderboard ===

  public query ({ caller }) func getLeaderboard() : async [(Principal, Nat)] {
    // Must be logged in and completed onboarding to view leaderboard
    requireOnboardingComplete(caller);

    let entries = userProfiles.entries().toArray().map(
      func((principal, profile)) { (principal, profile.points) }
    );

    entries.sort(func(a : (Principal, Nat), b : (Principal, Nat)) : Order.Order {
      Nat.compare(b.1, a.1) // Sort descending by points
    });
  };

  // === Admin Statistics ===

  public query ({ caller }) func getStatistics() : async {
    totalUsers : Nat;
    totalMessages : Nat;
    totalEvents : Nat;
    totalPoints : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view statistics");
    };

    let totalPoints = userProfiles.entries().toArray().foldLeft(
      0,
      func(acc, entry) { acc + entry.1.points }
    );

    {
      totalUsers = userProfiles.size();
      totalMessages = chatMessages.size();
      totalEvents = events.size();
      totalPoints;
    };
  };
};
