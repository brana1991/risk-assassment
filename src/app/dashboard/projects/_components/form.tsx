'use client';

import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Client } from '@/root/drizzle/schema';
import { insertProject } from '../page';

const FormSchema = z.object({
  name: z.string({
    required_error: 'Please select project name',
  }),
  clientName: z.string({
    required_error: 'Please select client name',
  }),
});

export type FormData = typeof FormSchema;

type Props = {
  clients: Client[];
};

export default function CreateProjectForm({ clients }: Props) {
  const form = useForm<z.infer<FormData>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => insertProject(data))} className=" space-y-6">
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right w-max">
                  Project Name
                </Label>
                <Input id="name" className="col-span-3" {...form.register('name')} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <>
                      <Label htmlFor="name" className="text-right w-max">
                        Client Name
                      </Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent className="col-span-3">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id as string}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
