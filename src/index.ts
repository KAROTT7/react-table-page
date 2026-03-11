export interface GreetingOptions {
	uppercase?: boolean;
}

export function createGreeting(name: string, options: GreetingOptions = {}): string {
	const message = `Hello, ${name}!`;

	return options.uppercase ? message.toUpperCase() : message;
}
