/** Three strokes grow into the existing card, never a second project gallery. */
export default function NoteFrame() {
	return <svg aria-hidden="true" className="note-frame" width="100%" height="100%">
		{[0, 1, 2].map(index => <rect key={index} x={3 + index * 2} y={3 + index * 2}
			width={`calc(100% - ${6 + index * 4}px)`} height={`calc(100% - ${6 + index * 4}px)`}
			rx="22" pathLength="1" className={`note-frame-stroke note-frame-${index}`} />)}
	</svg>;
}
