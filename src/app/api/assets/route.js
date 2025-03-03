import { NextResponse } from "next/server";
import fs from "fs/promises";

const filePath = "src/app/api/assets/assets.json";

export async function GET() {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        const assets = JSON.parse(data);
        return NextResponse.json(assets)
    } catch (errror) {
        return NextResponse.json({ error: "Error loading data", status: 500 })
    }
};

export async function POST(req) {
    try {
        const body = await req.json();

        const data = await fs.readFile(filePath, "utf-8");
        const assets = JSON.parse(data);

        const newAsset = { id: assets.length + 1, ...body };
        const updatedAssets = [...assets, newAsset];
        await fs.writeFile(filePath, JSON.stringify(updatedAssets, null, 2));
        return NextResponse.json(newAsset);
    } catch (error) {
        return NextResponse.json({ error: "Assot was not added" })
    }

}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        const data = await fs.readFile(filePath, "utf-8");
        const assets = JSON.parse(data);

        const newAssets = assets.filter((asset) => asset.id !== id);
        await fs.writeFile(filePath, JSON.stringify(newAssets, null, 2))
        return NextResponse.json(newAssets)
    } catch (error) {
        return NextResponse.json({ error: "Error deleting asset" })
    }

}

export async function PUT(req) {
    try {
        const { id, amount, unitPrice } = await req.json();

        const data = await fs.readFile(filePath, "utf-8");
        const assets = JSON.parse(data)

        const newAssets = assets.map(asset => asset.id === id ? { ...asset, amount, unitPrice } : asset)
        await fs.writeFile(filePath, JSON.stringify(newAssets, null, 2));
        return NextResponse.json(newAssets);
    } catch (error) {
        return NextResponse.json({ error: "Error editing asset" })
    }

}








