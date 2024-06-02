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

async function getAllEmployers() {
  try {
    const clients = await db.select().from(client);

    return clients;
  } catch (error) {
    console.error('Error retrieving employers:', error);
    throw error;
  }
}

export default async function Clients() {
  const clients = await getAllEmployers();

  return (
    <div
      style={{
        gridTemplateColumns:
          'minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)',
      }}
      className="grid gap-10"
    >
      {clients.map((client) => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle>Klijent</CardTitle>
            <CardDescription>{client.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{client.address}</p>
            <p>{client.identityNumber}</p>
            <p>{client.pib}</p>
            <p>{client.responsiblePerson}</p>
          </CardContent>
          <CardFooter>
            <button>Zapocni projekat</button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
