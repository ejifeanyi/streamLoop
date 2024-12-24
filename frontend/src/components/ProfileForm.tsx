"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfileForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Profile updated:", formData);
		// API call to update profile
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			<Input
				name="name"
				placeholder="Enter your name"
				value={formData.name}
				onChange={handleChange}
				required
			/>
			<Input
				name="email"
				placeholder="Enter your email"
				value={formData.email}
				onChange={handleChange}
				required
			/>
			<Button
				type="submit"
				className="w-full"
			>
				Update Profile
			</Button>
		</form>
	);
};

export default ProfileForm;
