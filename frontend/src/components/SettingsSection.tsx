"use client";

import React from "react";

interface SettingsSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
	title,
	description,
	children,
}) => {
	return (
		<section className="mb-8 bg-card rounded-xl shadow-lg p-6">
			<h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
			{description && (
				<p className="text-sm text-muted-foreground mb-4">{description}</p>
			)}
			<div>{children}</div>
		</section>
	);
};

export default SettingsSection;
