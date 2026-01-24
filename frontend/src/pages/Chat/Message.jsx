const Message = ({ msg, myId }) => {
  const isMine = msg.sender === myId;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className="bg-white p-3 rounded-lg max-w-xs shadow">
        {msg.text && <p>{msg.text}</p>}

        {msg.fileType === "image" && (
          <img src={msg.fileUrl} className="rounded mt-2 max-h-60" />
        )}

        {msg.fileType === "video" && (
          <video src={msg.fileUrl} controls className="mt-2 max-h-60" />
        )}

        {msg.fileType === "document" && (
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
          >
            📄 Open PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default Message;
