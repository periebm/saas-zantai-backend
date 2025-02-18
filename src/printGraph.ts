import * as tslab from 'tslab';
import { graph2 } from './IA_test_2/Graph';
import fs from 'fs/promises';

export async function printGraph() {
  const representation = graph2.getGraph();
  const image = await representation.drawMermaidPng();
  const arrayBuffer = await image.arrayBuffer();

  // Converte o ArrayBuffer para um Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  // Salva a imagem em um arquivo
  const filePath = './graph.png'; // Caminho onde a imagem será salva
  await fs.writeFile(filePath, uint8Array);

  console.log(`Imagem salva em: ${filePath}`);
}