import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PublicProfile {
    principal: Principal;
    displayName: string;
    validated: boolean;
    socialLinks: string;
    biography: string;
    eventsAttended: bigint;
    website: string;
    companyName: string;
    servicesOffered: string;
}
export interface PrivateUserProfile {
    displayName: string;
    dateOfBirth: string;
    socialLinks: string;
    onboardingComplete: boolean;
    fullName: string;
    email: string;
    website: string;
    address: string;
    phone: string;
    registrationComplete: boolean;
    profileComplete: boolean;
    points: bigint;
}
export interface Event {
    id: bigint;
    title: string;
    notAttendingCount: bigint;
    date: string;
    description: string;
    rsvpCount: bigint;
    location: string;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    votes: bigint;
    author: Principal;
    approved: boolean;
    timestamp: bigint;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveMessage(messageId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOnboarding(): Promise<void>;
    countValidatedEvents(principal: Principal): Promise<bigint>;
    createEvent(title: string, description: string, date: string, location: string): Promise<bigint>;
    createOrUpdatePublicProfile(profile: PublicProfile): Promise<void>;
    deleteEvent(eventId: bigint): Promise<void>;
    getAllMessages(): Promise<Array<ChatMessage>>;
    getCallerUserProfile(): Promise<PrivateUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(eventId: bigint): Promise<Event>;
    getLeaderboard(): Promise<Array<[Principal, bigint]>>;
    getOwnPublicProfile(): Promise<PublicProfile | null>;
    getPopularEvents(): Promise<Array<Event>>;
    getPublicProfile(principal: Principal): Promise<PublicProfile>;
    getStatistics(): Promise<{
        totalEvents: bigint;
        totalMessages: bigint;
        totalUsers: bigint;
        totalPoints: bigint;
    }>;
    getUserProfile(user: Principal): Promise<PrivateUserProfile | null>;
    getVisibleMessages(): Promise<Array<ChatMessage>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listEvents(): Promise<Array<Event>>;
    listPublicProfiles(): Promise<Array<PublicProfile>>;
    listPublicProfilesByValidation(validated: boolean): Promise<Array<PublicProfile>>;
    postMessage(content: string): Promise<bigint>;
    registerUser(): Promise<void>;
    removeMessage(messageId: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    rsvpToEvent(eventId: bigint, attending: boolean): Promise<void>;
    saveCallerUserProfile(profile: PrivateUserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setProfileValidation(principal: Principal, validated: boolean): Promise<void>;
    updateEvent(eventId: bigint, title: string, description: string, date: string, location: string): Promise<void>;
    voteMessage(messageId: bigint): Promise<void>;
}
