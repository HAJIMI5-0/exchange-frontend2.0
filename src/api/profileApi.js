import client from "./client"; // 使用统一的 axios 请求工具，里面已经配置了后端地址

// 获取个人信息
export async function fetchProfileApi(username) {
  const res = await client.get("/api/profile", {
    params: {
      username: username
    }
  });

  return res.data;
}

// 上传头像
export async function uploadAvatarApi(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await client.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data.url;
}

// 修改个人信息
export async function updateProfileApi(profile) {
  const res = await client.put("/api/profile", profile);

  return res.data;
}

// 翻译文本
export async function translateText(content, targetLang) {
  if (!content) return "";

  if (!targetLang) {
    return content;
  }

  try {
    const res = await client.post("/api/translate", {
      text: content,
      targetLang: targetLang
    });

    const data = res.data;

    if (typeof data === "string") {
      return data || content;
    }

    return (
      data.translatedText ||
      data.text ||
      data.result ||
      data.data ||
      content
    );
  } catch (err) {
    console.error("翻译失败:", err);
    return content;
  }
}