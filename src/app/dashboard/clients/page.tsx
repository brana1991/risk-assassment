import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '../../../../drizzle/client';
import { client } from '../../../../drizzle/schema';
import { Button } from '@/components/ui/button';
import { eq } from 'drizzle-orm';

export async function getAllEmployers() {
  try {
    const clients = await db.select().from(client);

    return clients;
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}
export async function getClientById(id: string) {
  try {
    const clientResponse = await db.select().from(client).where(eq(client.id, id));

    return clientResponse[0];
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}

export default async function Clients() {
  const clients = await getAllEmployers();

  return (
    <div className="grid grid-cols-4 gap-4">
      {clients.map((client) => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle>{client.name}</CardTitle>
            <CardDescription>{client.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              <b>PIB:</b> {client.pib}
            </CardDescription>
            <CardDescription>
              <b>Contact Person:</b> {client.responsiblePerson}
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="ml-auto h-6">
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
