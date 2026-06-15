export default function ErrorMessage({message}: { message?: string }) {
    if (!message) return null;
    return (
        <div
            className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-md">
            {message}
        </div>
    );
}