import "./style.css";

const captions = [
  "ごはんはまだかね？",
  "そこ、わたしの席です",
  "今日もかわいい。知ってる",
  "その会議、参加します",
  "おやつの気配がする",
  "人間、よく聞きなさい",
  "撫でてもよい",
  "ちゅ〜るの時間では？",
  "今は話しかけないで",
  "この家の責任者です",
  "ぜんぶ見ていました",
  "あと5分だけ寝る",
  "それ、箱ですよね？",
  "写真は事務所を通して",
  "異議ありにゃ",
  "本日の業務は終了しました",
  "なんか忘れてない？"
];

const input = document.querySelector<HTMLInputElement>("#photoInput");
const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const emptyState = document.querySelector<HTMLElement>("#emptyState");
const rerollButton = document.querySelector<HTMLButtonElement>("#rerollButton");
const downloadButton = document.querySelector<HTMLButtonElement>("#downloadButton");
const dropZone = document.querySelector<HTMLElement>("#dropZone");

if (!input || !canvas || !emptyState || !rerollButton || !downloadButton || !dropZone) {
  throw new Error("Required UI element was not found.");
}

const context = canvas.getContext("2d");
if (!context) throw new Error("Canvas is not supported by this browser.");

let sourceImage: HTMLImageElement | null = null;
let previousCaption = "";

function randomCaption(): string {
  const candidates = captions.filter((caption) => caption !== previousCaption);
  const caption = candidates[Math.floor(Math.random() * candidates.length)] ?? captions[0];
  previousCaption = caption;
  return caption;
}

function fitCanvas(image: HTMLImageElement): void {
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  context.font = `900 ${fontSize}px sans-serif`;
  const lines: string[] = [];
  let line = "";

  for (const char of text) {
    const candidate = line + char;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawSpeechBubble(caption: string): void {
  const padding = Math.max(24, canvas.width * 0.035);
  const fontSize = Math.max(30, Math.min(76, canvas.width * 0.062));
  const maxTextWidth = canvas.width * 0.68;
  const lines = wrapText(caption, maxTextWidth, fontSize);
  const lineHeight = fontSize * 1.25;
  const textWidth = Math.max(...lines.map((line) => context.measureText(line).width));
  const bubbleWidth = Math.min(canvas.width - padding * 2, textWidth + padding * 2);
  const bubbleHeight = lines.length * lineHeight + padding * 1.6;
  const placeTop = Math.random() > 0.45;
  const x = Math.random() * Math.max(1, canvas.width - bubbleWidth - padding * 2) + padding;
  const y = placeTop ? padding : canvas.height - bubbleHeight - padding - fontSize * 0.8;

  context.save();
  context.shadowColor = "rgba(0,0,0,0.24)";
  context.shadowBlur = fontSize * 0.24;
  context.shadowOffsetY = fontSize * 0.1;
  roundedRect(x, y, bubbleWidth, bubbleHeight, fontSize * 0.42);
  context.fillStyle = "rgba(255,255,255,0.95)";
  context.fill();
  context.lineWidth = Math.max(4, fontSize * 0.08);
  context.strokeStyle = "#201d1b";
  context.stroke();

  context.shadowColor = "transparent";
  const tailX = x + bubbleWidth * (0.2 + Math.random() * 0.6);
  const tailDirection = placeTop ? 1 : -1;
  const tailBaseY = placeTop ? y + bubbleHeight : y;
  context.beginPath();
  context.moveTo(tailX - fontSize * 0.24, tailBaseY);
  context.lineTo(tailX + fontSize * 0.16, tailBaseY + tailDirection * fontSize * 0.72);
  context.lineTo(tailX + fontSize * 0.45, tailBaseY);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = "#201d1b";
  context.font = `900 ${fontSize}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  lines.forEach((line, index) => {
    const textY = y + padding * 0.8 + lineHeight * (index + 0.5);
    context.fillText(line, x + bubbleWidth / 2, textY);
  });
  context.restore();
}

function render(): void {
  if (!sourceImage) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  drawSpeechBubble(randomCaption());
}

function loadFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    alert("画像ファイルを選択してください。");
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    sourceImage = image;
    fitCanvas(image);
    render();
    emptyState.hidden = true;
    canvas.hidden = false;
    rerollButton.disabled = false;
    downloadButton.disabled = false;
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    alert("画像を読み込めませんでした。別の画像を試してください。");
  };
  image.src = objectUrl;
}

input.addEventListener("change", () => {
  const file = input.files?.[0];
  if (file) loadFile(file);
});

rerollButton.addEventListener("click", render);

downloadButton.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cat-speech-bubble-${Date.now()}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, "image/png");
});

for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
}

dropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files[0];
  if (file) loadFile(file);
});
