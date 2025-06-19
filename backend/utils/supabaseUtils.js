import supabase from "../supabase.js";

export async function getMessagesHistory(user_id, chat_id) {
    const chat = await chatExists(user_id, chat_id);
    if (chat) {
        return await messagesHistory(user_id, chat_id);
    } else {
        await createChat(user_id, chat_id);
        return await messagesHistory(user_id, chat_id);
    }
}

export async function createMessage(user_id, chat_id, role, parts, message) {
    const { data, error } = await supabase
        .from("messages")
        .insert({ user_id, chat_id, role, parts, message })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function chatExists(user_id, chat_id) {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function getAllChats(user_id) {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function createChat(user_id, chat_id) {
    const chat = await chatExists(user_id, chat_id);
    if (chat) {
        return chat;
    } else {
        const { data, error } = await supabase
            .from("chats")
            .insert({ user_id, chat_id, title: "New Chat" })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export async function updateChatTitle(user_id, chat_id, title) {
    const { data, error } = await supabase
        .from("chats")
        .update({ title })
        .eq("user_id", user_id)
        .eq("chat_id", chat_id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteChat(user_id, chat_id) {
    const { data, error } = await supabase
        .from("chats")
        .delete()
        .eq("user_id", user_id)
        .eq("chat_id", chat_id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function messagesHistory(user_id, chat_id) {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user_id)
        .eq("chat_id", chat_id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function getProjectFiles(user_id, project_id, chat_id) {
    const { data, error } = await supabase
        .from("project_files")
        .select("files")
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .eq("chat_id", chat_id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function addProjectFiles(user_id, project_id, chat_id, files) {
    const { data, error } = await supabase
        .from("project_files")
        .insert({ user_id, project_id, chat_id, files })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateProjectFiles(user_id, project_id, chat_id, files) {
    const { data, error } = await supabase
        .from("project_files")
        .update({ files })
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .eq("chat_id", chat_id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteProjectFiles(user_id, project_id, chat_id) {
    const { data, error } = await supabase
        .from("project_files")
        .delete()
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .eq("chat_id", chat_id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
