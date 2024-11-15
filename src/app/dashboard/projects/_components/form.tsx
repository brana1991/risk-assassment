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

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Client } from '@/root/drizzle/schema';
import { insertProject } from '../page';
import { ProjectType, ProjectTypeMap } from '../types';

const FormSchema = z.object({
  name: z
    .string({
      required_error: 'Please enter project name',
    })
    .min(1),
  clientName: z.string({
    required_error: 'Please select client name',
  }),
  projectType: z.nativeEnum(ProjectType, {
    required_error: 'Please select project type',
  }),
});

export type FormData = z.infer<typeof FormSchema>;

type Props = {
  clients: Client[];
};

export default function CreateProjectForm({ clients }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => insertProject(data))} className=" space-y-6">
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-y-5 gap-x-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-y-1 gap-x-4 relative">
                    <FormLabel className="text-right w-max">Project Name</FormLabel>
                    <FormControl className="col-span-3">
                      <Input placeholder="Enter Project Name" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 row-start-2 col-start-2 text-xs absolute top-[-5px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-y-1 gap-x-4 relative">
                    <FormLabel className="text-right w-max">Client Name</FormLabel>
                    <FormControl className="col-span-3">
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
                    </FormControl>
                    <FormMessage className="col-span-4 row-start-2 col-start-2 text-xs absolute top-[-5px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-y-1 gap-x-4 relative">
                    <FormLabel className="text-right w-max">Project type</FormLabel>
                    <FormControl className="col-span-3">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="col-span-3">
                          <SelectItem
                            value={ProjectTypeMap.get(ProjectType.CATASTROPHE_RISK)?.type as string}
                          >
                            {ProjectTypeMap.get(ProjectType.CATASTROPHE_RISK)?.label}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="col-span-4 row-start-2 col-start-2 text-xs absolute top-[-5px]" />
                  </FormItem>
                )}
              />
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
