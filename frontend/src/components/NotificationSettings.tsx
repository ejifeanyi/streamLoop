"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

const NotificationSettings = () => {
	const [notifications, setNotifications] = useState({
		email: true,
		sms: false,
		push: true,
	});

	const toggleNotification = (type: keyof typeof notifications) => {
		setNotifications((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	return (
		<div className="space-y-4">
			{Object.entries(notifications).map(([key, value]) => (
				<div
					key={key}
					className="flex justify-between items-center"
				>
					<span className="capitalize text-sm text-foreground">
						{key} Notifications
					</span>
					<Switch
						checked={value}
						onCheckedChange={() =>
							toggleNotification(key as keyof typeof notifications)
						}
						className={value ? "bg-success" : "bg-muted"}
					/>
				</div>
			))}
		</div>
	);
};

export default NotificationSettings;
