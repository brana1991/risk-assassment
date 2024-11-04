'use client';

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Projects } from '@/root/drizzle/schema';
import { generateDocument } from '@/components/doc-generation/patch';

export function ProjectCards({ projects }: { projects: Projects[] }) {
  const handleGenerateDoc = async (id: string) => {
    try {
      await generateDocument(id);
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="h-60 flex flex-col">
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardFooter className="mt-auto flex justify-end gap-4">
            <Button variant="outline" asChild className="h-6">
              <Link href={`/project/${project.id}`}>Edit</Link>
            </Button>
            <Button variant="outline" className="h-6" onClick={() => handleGenerateDoc(project.id)}>
              Export to Doc
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
