"use client";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import React, { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutation} from "convex/react";
import { api } from "@/convex/_generated/api";


const eventFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.number(),
  storageId: z.string(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;


const formSchema = z.object({
  name: z.string().min(2),
  spellLevel: z.string(),
  file: z.any(),
});

export const AddSpell = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", spellLevel: "" },
  });

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveSummary = useMutation(api.spell.saveSummary);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    // 1. Get upload URL from convex
    const url = await generateUploadUrl();

    // 2. Upload file to convex storage
    const file = values.file[0];
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // 3. Call API route to summarize with OpenAI
    const summaryRes = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storageId,
        name: values.name,
        spellLevel: values.spellLevel,
      }),
    });
    const { summary } = await summaryRes.json();

    // 4. Save in Convex DB
    await saveSummary({
      storageId,
      name: values.name,
      spellLevel: values.spellLevel,
      summary,
    });

    setLoading(false);
    form.reset();
    onOpenChange(false);
  }


  return (
    <ResponsiveDialog
      description="Add a new event to your calendar"
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Event to SpyderSense"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="spellLevel"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spell Level</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="file"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="bg-pink-500 w-full" size={"lg"}>
            {loading ? "Uploading..." : "Add Spell"}
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
