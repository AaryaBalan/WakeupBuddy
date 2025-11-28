import { Image } from "expo-image";

const getAvatarUrl = (seed) =>
    `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}`;

export default function ProfilePic({ user, size = 60 }) {
    const seed = user?.profileImageSeed || user?.username || user?.id || "";

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