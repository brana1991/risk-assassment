import { getProjectById } from '@/app/dashboard/projects/page';
import { TextareaForm } from './_components/introdaction-section';
export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const project = await getProjectById(id);

  console.log(project);

  return (
    <div>
      <p>Naziv projekta: {project.projectName}</p>
      <p>Klijent: {project.clientId}</p>
      <TextareaForm introduction={project.sections?.participantsSection} />
    </div>
  );
}
