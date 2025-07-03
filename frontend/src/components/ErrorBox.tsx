export function ErrorBox({ error }: { error: Error }) {
	return <div className="error">{error.message}</div>;
}