import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProjects } from '../page';
import { Button } from '@/components/ui/button';

export async function ProjectCards() {
  const projects = await getUserProjects();

  return projects.map((project) => (
    <Card key={project.id}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.ownerId}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" className="ml-auto h-6">
          Edit
        </Button>
      </CardFooter>
    </Card>
  ));
}
