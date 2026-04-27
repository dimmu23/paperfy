import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest){
    try{
        const body = await req.json();

        console.log(body);

        const {name, email, password} = body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const trimmedName = typeof name === "string" ? name.trim() : "";
        

        if(!trimmedName || !normalizedEmail || !password){
            return NextResponse.json({
                message: "Missing fields"
            },{
                status: 400
            })
        }

        const existingUser = await prisma.user.findUnique({
            where:{
                email: normalizedEmail
            }
        });

        if(existingUser){
            return(
                NextResponse.json({
                    message: "User already exists"
                },{
                    status: 409
                })
            )
        }

        const hashPassword = await bcrypt.hash(password,10);

        await prisma.user.create({
            data:{
                name: trimmedName,
                email: normalizedEmail,
                password: hashPassword
            }
        })

        return NextResponse.json({
            message: "User Created"
        },{status: 201})
    }
    catch(error){
        console.error("Signup failed:", error);

        if (error instanceof Error && error.name === "PrismaClientInitializationError") {
            return NextResponse.json({
                message: "Database connection failed. Please check your Neon connection and try again."
            },{status: 503})
        }

        return NextResponse.json({
            message: "Internal server error"
        },{status: 500})
    }

}
