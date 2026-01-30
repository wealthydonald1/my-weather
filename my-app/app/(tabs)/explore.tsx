import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  useColorScheme,
  PanResponder,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

type Drop = {
  id: string;
  x: number; // 0..1 (normalized)
  y: number; // 0..1 (normalized)
  speed: number; // per tick
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function PlayScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const bg = isDark ? "#000" : "#f7f7fb";
  const text = isDark ? "#fff" : "#111";
  const sub = isDark ? "#bdbdbd" : "#555";
  const cardBg = isDark ? "#111" : "#fff";
  const border = isDark ? "#222" : "#eaeaea";

  // Game area sizes
  const GAME_W = Math.min(380, SCREEN_W - 32);
  const GAME_H = 520;

  // Bucket
  const BUCKET_W = 72;
  const BUCKET_H = 18;

  // State (keep state minimal for smoothness)
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [drops, setDrops] = useState<Drop[]>([]);

  // Bucket position:
  // - ref for physics/collision (fast, no re-render needed)
  // - state only for rendering position (updated at most once per tick)
  const bucketXRef = useRef(0.5);
  const [bucketXUI, setBucketXUI] = useState(0.5);

  // Refs for interval
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  // Drag tracking
  const dragStartBucketXRef = useRef(0.5);

  const difficulty = useMemo(() => {
    const spawnMs = Math.max(350, 900 - score * 12);
    const baseSpeed = Math.min(0.02, 0.008 + score * 0.00015);
    return { spawnMs, baseSpeed };
  }, [score]);

  const bounds = useMemo(() => {
    const minX = (BUCKET_W / 2) / GAME_W;
    const maxX = 1 - minX;
    return { minX, maxX };
  }, [BUCKET_W, GAME_W]);

  function reset() {
    setRunning(false);
    setScore(0);
    setLives(3);
    setDrops([]);
    bucketXRef.current = 0.5;
    setBucketXUI(0.5);
    dragStartBucketXRef.current = 0.5;
  }

  function stopIntervals() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    tickRef.current = null;
    spawnRef.current = null;
  }

  function start() {
    if (running) return;
    setRunning(true);
  }

  function stop() {
    setRunning(false);
  }

  // Spawn a raindrop
  function spawnDrop() {
    setDrops((prev) => [
      ...prev,
      {
        id: uid(),
        x: Math.random() * 0.9 + 0.05,
        y: -0.05,
        speed: difficulty.baseSpeed * (0.8 + Math.random() * 0.7),
      },
    ]);
  }

  // Drag handler (smooth)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => running,
        onMoveShouldSetPanResponder: () => running,
        onPanResponderGrant: () => {
          dragStartBucketXRef.current = bucketXRef.current;
        },
        onPanResponderMove: (_evt, gestureState) => {
          const dxNorm = gestureState.dx / GAME_W;
          const next = clamp(dragStartBucketXRef.current + dxNorm, bounds.minX, bounds.maxX);

          // Update ref immediately (physics uses this)
          bucketXRef.current = next;

          // Update UI smoothly without locking the game
          // (This is light and does not restart intervals)
          setBucketXUI(next);
        },
      }),
    [running, GAME_W, bounds.minX, bounds.maxX]
  );

  // Core game loop (NO dependency on bucketX UI)
  useEffect(() => {
    stopIntervals();
    if (!running) return;

    tickRef.current = setInterval(() => {
      const bx = bucketXRef.current;

      // Update drops & collisions
      setDrops((prev) => {
        const next: Drop[] = [];
        let caught = 0;
        let missed = 0;

        for (const d of prev) {
          const ny = d.y + d.speed;

          const bucketTopY = 0.90;
          const hitZone = ny >= bucketTopY;

          if (hitZone) {
            const bucketLeft = bx - (BUCKET_W / GAME_W) / 2;
            const bucketRight = bx + (BUCKET_W / GAME_W) / 2;

            const isCaught = d.x >= bucketLeft && d.x <= bucketRight;
            if (isCaught) caught += 1;
            else missed += 1;

            continue;
          }

          next.push({ ...d, y: ny });
        }

        if (caught > 0) setScore((s) => s + caught);
        if (missed > 0) setLives((l) => Math.max(0, l - missed));

        return next;
      });

      // Sync UI bucket position occasionally (optional but keeps things consistent)
      setBucketXUI(bucketXRef.current);
    }, 33);

    spawnRef.current = setInterval(() => {
      spawnDrop();
    }, difficulty.spawnMs);

    return () => stopIntervals();
    // IMPORTANT: no bucket dependency here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, difficulty.spawnMs, difficulty.baseSpeed, GAME_W, BUCKET_W]);

  // Auto-stop when lives reach 0
  useEffect(() => {
    if (lives <= 0 && running) setRunning(false);
  }, [lives, running]);

  return (
    <View style={[styles.page, { backgroundColor: bg }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: text }]}>Play</Text>
          <Text style={{ color: sub, marginTop: 2 }}>
            Drag the bucket smoothly to catch raindrops.
          </Text>
        </View>

        <Pressable
          onPress={reset}
          style={[styles.pillBtn, { backgroundColor: cardBg, borderColor: border }]}
        >
          <Text style={{ color: text, fontWeight: "900" }}>Reset</Text>
        </Pressable>
      </View>

      <View style={[styles.hud, { backgroundColor: cardBg, borderColor: border }]}>
        <Text style={{ color: text, fontWeight: "900" }}>Score: {score}</Text>
        <Text style={{ color: text, fontWeight: "900" }}>Lives: {lives}</Text>

        {!running ? (
          <Pressable
            onPress={start}
            disabled={lives <= 0}
            style={[
              styles.actionBtn,
              { backgroundColor: "#111", opacity: lives <= 0 ? 0.5 : 1 },
            ]}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              {lives <= 0 ? "Game Over" : "Start"}
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={stop} style={[styles.actionBtn, { backgroundColor: "#111" }]}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>Pause</Text>
          </Pressable>
        )}
      </View>

      {/* GAME AREA */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.gameBox,
          { width: GAME_W, height: GAME_H, backgroundColor: cardBg, borderColor: border },
        ]}
      >
        {/* Drops */}
        {drops.map((d) => {
          const left = d.x * GAME_W - 8;
          const top = d.y * GAME_H;
          return (
            <View
              key={d.id}
              style={[
                styles.drop,
                {
                  left,
                  top,
                  backgroundColor: isDark ? "#7dd3fc" : "#2563eb",
                },
              ]}
            />
          );
        })}

        {/* Bucket */}
        <View
          style={[
            styles.bucket,
            {
              width: BUCKET_W,
              height: BUCKET_H,
              left: bucketXUI * GAME_W - BUCKET_W / 2,
              top: GAME_H * 0.90,
              backgroundColor: isDark ? "#fff" : "#111",
            },
          ]}
        />
      </View>

      <Text style={{ color: sub, marginTop: 10, textAlign: "center" }}>
        Tip: Press Start, then drag anywhere inside the game box.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  h1: { fontSize: 28, fontWeight: "900" },

  hud: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  gameBox: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    alignSelf: "center",
    position: "relative",
  },

  drop: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
  },

  bucket: {
    position: "absolute",
    borderRadius: 999,
  },

  pillBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  actionBtn: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});