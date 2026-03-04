import VoiceRecorder from './VoiceRecorder'

export default function LogCard({ questionNumber, totalQuestions, question, onTranscript, transcript, disabled = false }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
      <div className="w-full max-w-sm">
        <p className="text-xs text-text-muted mb-4 text-center">
          {questionNumber} of {totalQuestions}
        </p>

        <h2 className="text-lg font-semibold text-text text-center mb-8 leading-relaxed">
          {question}
        </h2>

        {transcript ? (
          <div className="bg-surface border border-border rounded-xl p-4 mb-6">
            <p className="text-sm text-text leading-relaxed">{transcript}</p>
          </div>
        ) : (
          <VoiceRecorder onTranscript={onTranscript} disabled={disabled} />
        )}
      </div>
    </div>
  )
}
