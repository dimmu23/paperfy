import prisma from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try{
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get("userId");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");

        if(!page || !limit || !userId ){
            return NextResponse.json({
                success: false,
                message: "Parameters missing"
            },{
                status: 400
            })
        }

        const pageNum = parseInt(page);
        const PageSize = parseInt(limit);

        if(!userId){
            return NextResponse.json({
                success: false,
                message: "Parameters Missing"
            },{
                status: 400
            })
        }

        const papers =  await prisma.paper.findMany({
            where:{
                userId: userId,
            },
            orderBy: {createdAt: "desc"},
            skip: (pageNum-1)*PageSize,
            take: PageSize
        })

        const totalCount = await prisma.paper.count({
            where:{
                userId
            }
        })

        return NextResponse.json({
            success: true,
            papers,
            totalCount,
            totalPages: Math.ceil(totalCount/PageSize),
            currentPage: pageNum
        })
    }
    catch(err){
        console.log(err);
        return NextResponse.json({
            success: false,
            message: "Error fetching papers"
        },{
            status: 500
        })        
    }
}
