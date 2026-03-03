import VoiceRecorder from './VoiceRecorder'

export default function LogCard({ questionNumber, totalQuestions, question, onTranscript, transcript, disabled = false }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs text-[#888888] mb-4 text-center">
          {questionNumber} of {totalQuestions}
        </p>

        <h2 className="text-lg font-semibold text-[#F0F0F0] text-center mb-8 leading-relaxed">
          {question}
        </h2>

        {transcript ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#F0F0F0] leading-relaxed">{transcript}</p>
          </div>
        ) : (
          <VoiceRecorder onTranscript={onTranscript} disabled={disabled} />
        )}
      </div>
    </div>
  )
}
