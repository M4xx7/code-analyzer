export default function ErrorMessage({message}: { message?: string }) {
    if (!message) return null;
    return (
        <div
            className="mt-5 bg-red-500/13 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-center">
            {message}
        </div>
    );
}