import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const { paperId, audio, audioUrl } = body;
        const resolvedAudioUrl = audioUrl || audio;

        if (!paperId || !resolvedAudioUrl) {
            return NextResponse.json({
                message: "Missing paperId or audio URL"
            }, {
                status: 400
            });
        }

        await prisma.paper.update({
            where:{
                id: paperId
            },
            data:{
                audio: resolvedAudioUrl
            }
        })

        return NextResponse.json({
            message: "Audio saved successfully"
        })

    }catch(err){
        console.log(err);
        return NextResponse.json({
            message: "Error Saving Audio"
        }, {
            status: 500
        })
    }
}
