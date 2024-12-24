"use client";

import React from "react";
import SettingsSection from "@/components/SettingsSection";
import ProfileForm from "@/components/ProfileForm";
import NotificationSettings from "@/components/NotificationSettings";
import ChangePasswordForm from "@/components/ChangePasswordForm";

const Settings = () => {
	return (
		<div className="min-h-screen bg-background p-8">
			<header className="mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground">
					Settings
				</h1>
				<p className="text-sm text-muted-foreground mt-2">
					Update your account settings and preferences.
				</p>
			</header>

			{/* Profile Section */}
			<SettingsSection
				title="Profile"
				description="Update your personal information."
			>
				<ProfileForm />
			</SettingsSection>

			{/* Password Section */}
			<SettingsSection
				title="Change Password"
				description="Secure your account by updating your password."
			>
				<ChangePasswordForm />
            </SettingsSection>
            
			{/* Notifications Section */}
			<SettingsSection
				title="Notifications"
				description="Manage how you receive updates and alerts."
			>
				<NotificationSettings />
			</SettingsSection>
		</div>
	);
};

export default Settings;
