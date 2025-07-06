import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";

import "../../../../envConfig";

// Configure Airtable
const base = new Airtable({
	apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

export async function POST(request: NextRequest) {
	try {
		const { name, email, phone } = await request.json();

		// Validate required fields
		if (!name || !email || !phone) {
			return NextResponse.json(
				{ error: "name, email, and phone are required" },
				{ status: 400 },
			);
		}

		// Create record in Airtable
		const record = await base(process.env.AIRTABLE_TABLE_NAME).create({
			name,
			email,
			phone,
		});

		return NextResponse.json({
			success: true,
			recordId: record.getId(),
		});
	} catch (error) {
		console.error("Airtable error:", error);
		return NextResponse.json(
			{ error: "Failed to submit form" },
			{ status: 500 },
		);
	}
}
