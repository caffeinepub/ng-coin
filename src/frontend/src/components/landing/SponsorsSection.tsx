import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const sponsors = [
  {
    name: 'NG Environnement',
    url: 'https://www.ngenvironnement.org/',
  },
  {
    name: 'DMC Technologies',
    url: 'https://dmc-technologies.fr/',
  },
  {
    name: 'Iorga',
    url: 'https://iorga.com/',
  },
  {
    name: 'Metadev',
    url: 'https://metadev3.com/',
  },
];

export default function SponsorsSection() {
  return (
    <div className="mb-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
        Sponsors
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sponsors.map((sponsor) => (
          <Card key={sponsor.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{sponsor.name}</CardTitle>
            </CardHeader>
            <CardContent className="mt-auto">
              <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  Learn more
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
