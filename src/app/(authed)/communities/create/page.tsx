import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "List your property — Dwelli",
};

export default function CreateCommunityPage() {
	redirect("/wizard");
}
