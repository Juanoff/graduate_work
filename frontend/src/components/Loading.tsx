export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-white gap-2">
			<div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
			<div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
			<div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
		</div>
	);
}
