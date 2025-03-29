import fs from 'fs/promises';
import { graphManagerPromise } from './IA_Agent/Graph';

export async function printGraph() {
  const graphManager = await graphManagerPromise;
  const graph = graphManager.getGraph();

  const representation = graph.getGraph();
  const image = await representation.drawMermaidPng();
  const arrayBuffer = await image.arrayBuffer();

  // Converte o ArrayBuffer para um Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  // Salva a imagem em um arquivo
  const filePath = './graph.png'; // Caminho onde a imagem será salva
  await fs.writeFile(filePath, uint8Array);

  console.log(`Imagem salva em: ${filePath}`);
}
