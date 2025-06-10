export const streamApi = async (prompt: string) => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/test-template`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("ReadableStream not supported");
        }

        const decoder = new TextDecoder();
        let result = "";

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);
            result += chunk;
        }

        return result;
    } catch (error) {
        console.error("Streaming error:", error);
        throw error;
    }
};
