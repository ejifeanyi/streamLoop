"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChangePasswordForm = () => {
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}
		console.log("Password updated:", passwordData);
		// API call to change password
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			<Input
				type="password"
				name="currentPassword"
				placeholder="Enter current password"
				value={passwordData.currentPassword}
				onChange={handleChange}
				required
			/>
			<Input
				type="password"
				name="newPassword"
				placeholder="Enter new password"
				value={passwordData.newPassword}
				onChange={handleChange}
				required
			/>
			<Input
				type="password"
				name="confirmPassword"
				placeholder="Confirm new password"
				value={passwordData.confirmPassword}
				onChange={handleChange}
				required
			/>
			<Button
				type="submit"
				className="w-full"
			>
				Change Password
			</Button>
		</form>
	);
};

export default ChangePasswordForm;
