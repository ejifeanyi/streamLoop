"use client";

import Loader from "@/components/Loader";
// import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CreditCardIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { useAuth } from "./AuthContext";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import AnimationContainer from "@/components/AnimationContainer";
import { BorderBeam } from "@/components/ui/border-beam";
import { COMPANIES, PROCESS, REVIEWS } from "@/constants/misc";
import Image from "next/image";
import MagicBadge from "@/components/ui/magic-badge";
import { BentoCard, BentoGrid, CARDS } from "@/components/ui/bento-grid";
import MagicCard from "@/components/ui/magic-card";
import PricingCards from "@/components/pricing-cards";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LampContainer } from "@/components/LampContainer";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/footer";

interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

interface Session {
	user: User | null;
}

export default function Home() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	// const { signIn } = useAuth();
	const router = useRouter();

	// Effect for checking authentication
	useEffect(() => {
		const checkAuth = async () => {
			try {
				console.log("Starting authentication check...");
				const response = await fetch(`http://localhost:5000/auth/check`, {
					method: "GET",
					credentials: "include",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				});

				console.log("Response received:", response);

				const contentType = response.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					throw new TypeError("Oops, we haven't got JSON!");
				}

				const data = await response.json();
				console.log("Response data:", data);

				if (data.authenticated) {
					setSession({ user: data.user });
					console.log("User Authenticated", data.user);
				} else {
					setSession(null);
					console.log("User not authenticated");
				}
			} catch (error) {
				console.error("Detailed Auth Check Error:", error);
				setSession(null);
			} finally {
				setLoading(false);
				console.log("Authentication check completed");
			}
		};

		checkAuth();
	}, []);

	// Separate effect for handling navigation
	useEffect(() => {
		if (session?.user) {
			router.push("/stream");
		}
	}, [session, router]);

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<div
				id="home"
				className="absolute inset-0 dark:bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-full"
			/>
			<Navbar />
			<main className="mt-20 mx-auto w-full z-0 relative">
				<div className="overflow-x-hidden scrollbar-hide size-full">
					{/* Hero Section */}
					<MaxWidthWrapper>
						<div className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background">
							<AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
								<button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
									<span>
										<span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
									</span>
									<span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
									<span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/20"></span>
									<span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1">
										✨ A top-notch source for streaming
										<ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
									</span>
								</button>
								<h1 className="text-foreground text-center py-6 text-5xl font-bold tracking-normal text-balance sm:text-6xl md:text-7xl lg:text-8xl !leading-[1.15] w-full font-heading">
									<span className="text-transparent mx-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text inline-bloc">
										Stream Everywhere,
									</span>
									<br />
									All at Once
								</h1>
								<p className="mb-12 text-lg tracking-tight text-muted-foreground md:text-xl text-balance">
									Reach your audience on multiple platforms simultaneously
									<br className="hidden md:block" />
									<span className="hidden md:block">
										with seamless control.
									</span>
								</p>
								<div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">
									<Button asChild>
										<Link href={"/auth/sign-in"} className="flex items-center">
											Start Streaming for Free
											<ArrowRightIcon className="w-4 h-4 ml-2" />
										</Link>
									</Button>
								</div>
							</AnimationContainer>

							<AnimationContainer
								delay={0.2}
								className="relative pt-20 pb-20 md:py-32 px-2 bg-transparent w-full"
							>
								<div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow"></div>
								<div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
									<BorderBeam size={250} duration={12} delay={9} />
									<div className="w-full h-[400px] bg-black"></div>
									<div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40"></div>
									<div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-50"></div>
								</div>
							</AnimationContainer>
						</div>
					</MaxWidthWrapper>

					{/* Companies Section */}
					<MaxWidthWrapper>
						<AnimationContainer delay={0.4}>
							<div className="py-14">
								<div className="mx-auto px-4 md:px-8">
									<h2 className="text-center text-sm font-medium font-heading text-neutral-400 uppercase">
										Trusted by the best in the industry
									</h2>
									<div className="mt-8">
										<ul className="flex flex-wrap items-center gap-x-6 gap-y-6 md:gap-x-16 justify-center">
											{COMPANIES.map((company) => (
												<li key={company.name}>
													<Image
														src={company.logo}
														alt={company.name}
														width={80}
														height={80}
														quality={100}
														className="w-28 h-auto"
													/>
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</AnimationContainer>
					</MaxWidthWrapper>

					{/* Features Section */}
					<MaxWidthWrapper className="pt-10">
						<AnimationContainer delay={0.1}>
							<div className="flex flex-col w-full items-center lg:items-center justify-center py-8">
								<MagicBadge title="Features" />
								<h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
									Manage Links Like a Pro
								</h2>
								<p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
									Faria is a powerful link management tool that helps you
									shorten, track, and organize all your links in one place.
								</p>
							</div>
						</AnimationContainer>
						<AnimationContainer delay={0.2}>
							<BentoGrid className="py-8">
								{CARDS.map((feature, idx) => (
									<BentoCard key={idx} {...feature} />
								))}
							</BentoGrid>
						</AnimationContainer>
					</MaxWidthWrapper>

					{/* Process Section */}
					<MaxWidthWrapper className="py-10">
						<AnimationContainer delay={0.1}>
							<div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
								<MagicBadge title="The Process" />
								<h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
									Effortless Streaming in 3 Steps
								</h2>
								<p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
									Follow these simple steps to optimize, organize, and share
									your links with ease.
								</p>
							</div>
						</AnimationContainer>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full py-8 gap-4 md:gap-8">
							{PROCESS.map((process, id) => (
								<AnimationContainer delay={0.2 * id} key={id}>
									<MagicCard className="group md:py-8">
										<div className="flex flex-col items-start justify-center w-full">
											<process.icon
												strokeWidth={1.5}
												className="w-10 h-10 text-foreground"
											/>
											<div className="flex flex-col relative items-start">
												<span className="absolute -top-6 right-0 border-2 border-border text-foreground font-medium text-2xl rounded-full w-12 h-12 flex items-center justify-center pt-0.5">
													{id + 1}
												</span>
												<h3 className="text-base mt-6 font-medium text-foreground">
													{process.title}
												</h3>
												<p className="mt-2 text-sm text-muted-foreground">
													{process.description}
												</p>
											</div>
										</div>
									</MagicCard>
								</AnimationContainer>
							))}
						</div>
					</MaxWidthWrapper>

					{/* Pricing Section */}
					<MaxWidthWrapper className="py-10">
						<AnimationContainer delay={0.1}>
							<div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
								<MagicBadge title="Simple Pricing" />
								<h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
									Choose a plan that works for you
								</h2>
								<p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
									Get started with Faria today and enjoy more features with our
									pro plans.
								</p>
							</div>
						</AnimationContainer>
						<AnimationContainer delay={0.2}>
							<PricingCards />
						</AnimationContainer>
						<AnimationContainer delay={0.3}>
							<div className="flex flex-wrap items-start md:items-center justify-center lg:justify-evenly gap-6 mt-12 max-w-5xl mx-auto w-full">
								<div className="flex items-center gap-2">
									<CreditCardIcon className="w-5 h-5 text-foreground" />
									<span className="text-muted-foreground">
										No credit card required
									</span>
								</div>
							</div>
						</AnimationContainer>
					</MaxWidthWrapper>

					{/* Reviews Section */}
					<MaxWidthWrapper className="py-10">
						<AnimationContainer delay={0.1}>
							<div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
								<MagicBadge title="Our Customers" />
								<h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
									What our users are saying
								</h2>
								<p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
									Here&apos;s what some of our users have to say about Faria.
								</p>
							</div>
						</AnimationContainer>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-start gap-4 md:gap-8 py-10">
							<div className="flex flex-col items-start h-min gap-6">
								{REVIEWS.slice(0, 3).map((review, index) => (
									<AnimationContainer delay={0.2 * index} key={index}>
										<MagicCard key={index} className="md:p-0">
											<Card className="flex flex-col w-full border-none h-min">
												<CardHeader className="space-y-0">
													<CardTitle className="text-lg font-medium text-muted-foreground">
														{review.name}
													</CardTitle>
													<CardDescription>{review.username}</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4 pb-4">
													<p className="text-muted-foreground">
														{review.review}
													</p>
												</CardContent>
												<CardFooter className="w-full space-x-1 mt-auto">
													{Array.from({ length: review.rating }, (_, i) => (
														<StarIcon
															key={i}
															className="w-4 h-4 fill-yellow-500 text-yellow-500"
														/>
													))}
												</CardFooter>
											</Card>
										</MagicCard>
									</AnimationContainer>
								))}
							</div>
							<div className="flex flex-col items-start h-min gap-6">
								{REVIEWS.slice(3, 6).map((review, index) => (
									<AnimationContainer delay={0.2 * index} key={index}>
										<MagicCard key={index} className="md:p-0">
											<Card className="flex flex-col w-full border-none h-min">
												<CardHeader className="space-y-0">
													<CardTitle className="text-lg font-medium text-muted-foreground">
														{review.name}
													</CardTitle>
													<CardDescription>{review.username}</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4 pb-4">
													<p className="text-muted-foreground">
														{review.review}
													</p>
												</CardContent>
												<CardFooter className="w-full space-x-1 mt-auto">
													{Array.from({ length: review.rating }, (_, i) => (
														<StarIcon
															key={i}
															className="w-4 h-4 fill-yellow-500 text-yellow-500"
														/>
													))}
												</CardFooter>
											</Card>
										</MagicCard>
									</AnimationContainer>
								))}
							</div>
							<div className="flex flex-col items-start h-min gap-6">
								{REVIEWS.slice(6, 9).map((review, index) => (
									<AnimationContainer delay={0.2 * index} key={index}>
										<MagicCard key={index} className="md:p-0">
											<Card className="flex flex-col w-full border-none h-min">
												<CardHeader className="space-y-0">
													<CardTitle className="text-lg font-medium text-muted-foreground">
														{review.name}
													</CardTitle>
													<CardDescription>{review.username}</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4 pb-4">
													<p className="text-muted-foreground">
														{review.review}
													</p>
												</CardContent>
												<CardFooter className="w-full space-x-1 mt-auto">
													{Array.from({ length: review.rating }, (_, i) => (
														<StarIcon
															key={i}
															className="w-4 h-4 fill-yellow-500 text-yellow-500"
														/>
													))}
												</CardFooter>
											</Card>
										</MagicCard>
									</AnimationContainer>
								))}
							</div>
						</div>
					</MaxWidthWrapper>

					{/* CTA Section */}
					<MaxWidthWrapper className="mt-20 max-w-[100vw] overflow-x-hidden scrollbar-hide">
						<AnimationContainer delay={0.1}>
							<LampContainer>
								<div className="flex flex-col items-center justify-center relative w-full text-center">
									<h2 className="bg-gradient-to-b from-neutral-200 to-neutral-400 py-4 bg-clip-text text-center text-4xl md:text-7xl !leading-[1.15] font-medium font-heading tracking-tight text-transparent mt-8">
										Step into the future of link management
									</h2>
									<p className="text-muted-foreground mt-6 max-w-md mx-auto">
										Experience the cutting-edge solution that transforms how you
										handle your links. Elevate your online presence with our
										next-gen platform.
									</p>
									<div className="mt-6">
										<Button>
											Get started for free
											<ArrowRightIcon className="w-4 h-4 ml-2" />
										</Button>
									</div>
								</div>
							</LampContainer>
						</AnimationContainer>
					</MaxWidthWrapper>
				</div>
			</main>
			<Footer />
		</>
	);
}
