import { Image } from "expo-image";

const getAvatarUrl = (seed) =>
    `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}`;

export default function ProfilePic({ user, size = 60, seed: customSeed }) {
    // Priority: customSeed > profile_code > email > username > id
    const seed = customSeed || user?.profile_code || user?.email || user?.username || user?.id || "default";

    return (
        <Image
            source={{ uri: getAvatarUrl(seed) }}
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
            }}
        />
    );
}