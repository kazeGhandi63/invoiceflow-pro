"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Download, FileText, PlusCircle, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { STATE_TAX_RATES, US_STATES } from "@/lib/tax-rates";

const invoiceItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  quantity: z.coerce.number().positive({ message: "Must be > 0." }),
  price: z.coerce.number().nonnegative({ message: "Cannot be negative." }),
});

const invoiceFormSchema = z.object({
  fromName: z.string().min(1, "Your name is required."),
  fromAddress: z.string().min(1, "Your address is required."),
  toName: z.string().min(1, "Client's name is required."),
  toAddress: z.string().min(1, "Client's address is required."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  invoiceDate: z.date({ required_error: "Invoice date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(invoiceItemSchema).min(1, { message: "Please add at least one item." }),
  taxState: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm() {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      fromName: "",
      fromAddress: "",
      toName: "",
      toAddress: "",
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceDate: new Date(),
      items: [{ description: "", quantity: 1, price: 0 }],
      notes: "Thank you for your business!",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [subtotal, setSubtotal] = React.useState(0);
  const [tax, setTax] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  const items = form.watch("items");
  const taxState = form.watch("taxState");

  React.useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxRate = taxState ? STATE_TAX_RATES[taxState] || 0 : 0;
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [items, taxState]);

  function onSubmit(data: InvoiceFormValues) {
    console.log(data);
    toast.success("Invoice Generated!", {
      description: "Check the console for the invoice data.",
    });
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8" />
                <div>
                  <CardTitle>Invoice Pro</CardTitle>
                  <CardDescription>Create and manage professional invoices</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button type="submit">Generate Invoice</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid sm:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Invoice Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold">Bill From</h3>
                <FormField control={form.control} name="fromName" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Company" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="fromAddress" render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Bill To</h3>
                <FormField control={form.control} name="toName" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Client's Company" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="toAddress" render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="456 Client Ave, Otherville, USA" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Services</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => <Input placeholder="Service description" {...field} />} />
                      </TableCell>
                      <TableCell>
                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" placeholder="1" {...field} />} />
                      </TableCell>
                      <TableCell>
                        <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => <Input type="number" placeholder="100.00" {...field} />} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((items[index]?.quantity || 0) * (items[index]?.price || 0))}
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ description: "", quantity: 1, price: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Any additional information..." {...field} /></FormControl></FormItem>} />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="taxState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax State</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state to apply tax" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxState ? `${(STATE_TAX_RATES[taxState] * 100).toFixed(2)}%` : '0%'})</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}