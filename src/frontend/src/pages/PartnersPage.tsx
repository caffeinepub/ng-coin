import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const partners = [
  {
    name: 'DMC Technologies',
    logo: '/assets/generated/partner-dmc-technologies.dim_512x256.png',
    description: 'IT consulting firm specializing in digital transformation from Web1 to Web3, offering strategic guidance and technical integration.',
    url: 'https://www.dmc-technologies.fr',
  },
  {
    name: 'NG Environnement',
    logo: '/assets/generated/partner-ng-environnement.dim_512x256.png',
    description: 'NGO implementing high-impact social and humanitarian projects on the ground, with expertise in local territories and communities.',
    url: 'https://www.ngenvironnement.org',
  },
  {
    name: 'Iorga',
    logo: '/assets/generated/partner-iorga.dim_512x256.png',
    description: 'Technical partner providing blockchain expertise and infrastructure solutions for the NG COIN project on Internet Computer Protocol.',
    url: 'https://iorga.com',
  },
  {
    name: 'Metadev',
    logo: '/assets/generated/partner-metadev.dim_512x256.png',
    description: 'Development partner specializing in blockchain innovation and Web3 solutions, contributing technical expertise to the project.',
    url: 'http://metadev3.com',
  },
];

export default function PartnersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Our Partners</h1>
        <p className="text-muted-foreground">
          Organizations supporting the NG COIN community and mission
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {partners.map((partner) => (
          <Card key={partner.name} className="flex flex-col">
            <CardHeader>
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted/30 p-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <CardTitle>{partner.name}</CardTitle>
              <CardDescription>{partner.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <a href={partner.url} target="_blank" rel="noopener noreferrer">
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
