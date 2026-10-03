"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRegister } from "@/hooks/useAuth";

const schema = z.object({
  name: z.string().min(2, "At least 2 characters").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  phone: z.string().min(10).max(20).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const signup = useRegister();

  const onSubmit = (values: FormValues) =>
    signup.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      ...(values.phone && { phone: values.phone }),
    });

  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Start making posters in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="মোঃ করিম উদ্দিন"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          id="phone"
          label="Phone (optional)"
          placeholder="01712345678"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" className="w-full" disabled={signup.isPending}>
          {signup.isPending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}