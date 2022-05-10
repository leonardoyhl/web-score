import { Note, ScorePart } from 'player-core';
import { Measure } from 'player-core/dist/data-format/measure';
import { xml2json, Options } from 'xml-js';
import { groupBy } from 'lodash-es';

export function xmlToJson(xml: string, options?: Options.XML2JSON) {
  return JSON.parse(xml2json(xml, Object.assign({compact: true}, options)));
}

export function extractNotes(musicXmlJson: any) {
  const scorePart = {
    id: '0',
    measures: [],
  } as ScorePart;
  // const musicXmlJson = xmlToJson(musicXml);
  if (!musicXmlJson) return scorePart;
  const divisions = parseInt(musicXmlJson['score-partwise']['part']['measure'][0]['attributes']['divisions']._text);
  const measures = musicXmlJson['score-partwise']['part']['measure'] as any[];
  measures.forEach(measureItem => {
    if (!measureItem.note) return;
    const measure = {
      number: parseInt(measureItem['_attributes']['number']),
      notes: [],
    } as unknown as Measure;
    measureItem.note.forEach((noteItem: any) => {
      // @ts-ignore
      const normalizedNote = {
        type: noteItem.type._text,
        pitch: {
          step: noteItem.pitch.step._text,
          octave: noteItem.pitch.octave._text,
          alter: noteItem.pitch.alter && noteItem.pitch.alter._text || '0',
        },
        duration: parseInt(noteItem.duration._text),
        stay: parseInt(noteItem.duration._text) / divisions, // 几倍时长
        staff: noteItem.staff && noteItem.staff._text || 'default', // 位于哪条五线谱
        chord: noteItem.chord ? true : false, // 和弦
      } as Note;
      measure.notes.push(normalizedNote);
    });
    scorePart.measures.push(measure);
  });
  return scorePart;
}

export interface WithTimelineNote extends Note {
  timestamp: number;
  played: boolean;
}

export function transformNotesWithTimeline(scorePart: ScorePart, quaterTime: number) {
  const result: WithTimelineNote[] = [];
  let totalTime = 0;
  scorePart.measures.forEach(measure => {
    let measureTime = totalTime;
    // @ts-ignore
    const noteGroups = groupBy(measure.notes, (note => note.staff));
    Object.values(noteGroups).forEach(groupedNotes => {
      let time = totalTime;
      let oldTime = time;
      groupedNotes.forEach(note => {
        // @ts-ignore
        const beginTime = note.chord ? oldTime : time; // 和弦的时候采用上一次的开始时间
        const finalNote = {
          ...note,
          timestamp: beginTime, // 开始播放的时间
          played: false,
        };
        result.push(finalNote);
        // @ts-ignore
        if (!note.chord) {
          oldTime = time;
          // @ts-ignore
          time += quaterTime * note.stay;
        }
        if (time > measureTime) {
          measureTime = time;
        }
      });
    });
    totalTime = measureTime;
  });
  return result;
}
