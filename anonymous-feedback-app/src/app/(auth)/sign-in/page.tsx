'use client'

import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {zodResolver} from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from "next/link";
import { signInSchema } from '@/schemas/signInSchema';
import { signIn } from 'next-auth/react';



const page = () => {

  const { toast } = useToast();

  const router = useRouter();

  // zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
      identifier: '',
      password: ''
      }
  });



    const onSubmit = async (data: z.infer<typeof signInSchema>) => {

        const result = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password
        });

        if(result?.error){

            toast({
                title: "Login failed",
                description: "Incorrect username or password",
                variant: "destructive"
            });
        };

        if(result?.url){
            router.replace('/dashboard');
        };

    };


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">

            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">

                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Welcome Back to True Feedback
                    </h1>
                    <p className="mb-4">Sign in to start your anonymous adventure</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email/Username</FormLabel>

                                    <FormControl>
                                        <Input placeholder="email/username" {...field} 
                                        />
                                    </FormControl>

                                    <FormMessage />

                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>

                                    <FormControl>
                                        <Input type="password" placeholder="password" {...field} 
                                        />
                                    </FormControl>

                                    <FormMessage />

                                </FormItem>
                            )}
                        />

                        <Button type="submit">
                            Signin
                        </Button>

                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                        Sign in
                        </Link>
                    </p>
                </div>

            </div>

        </div>
        
    );


};

export default page;


