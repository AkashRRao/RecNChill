let feedbackData = {
  userId: '1234',
  moviesLiked: new Set(),
  moviesDisliked: new Set(),
};

let cards = new Set();

function submitMovieFeedback() {
  cards.forEach((card) => card.destroy());
  feedbackData.moviesLiked = Array.from(feedbackData.moviesLiked).map((id) =>
    Number(id)
  );
  feedbackData.moviesDisliked = Array.from(
    feedbackData.moviesDisliked
  ).map((id) => Number(id));
  socket.emit('submit feedback', feedbackData);
  let submitDiv = document.getElementById('submit-feedback');
  submitDiv.querySelector('button').innerText = 'Loading...';
  submitDiv.querySelector('button').disabled = true;
}

document.addEventListener('DOMContentLoaded', function () {
  var Direction = window.swing.Direction;

  const config = {
    minThrowOutDistance: window.innerWidth / 6,
    maxThrowOutDistance: window.innerWidth / 6 + 20,
    maxRotation: window.innerWidth / 600,
    allowedDirections: [Direction.LEFT, Direction.RIGHT],
  };

  let stack;
  stack = window.swing.Stack(config);

  [].forEach.call(document.querySelectorAll('.card'), function (targetElement) {
    stack.createCard(targetElement);
  });

  stack.on('throwout', function (e) {
    const movieId = e.target.querySelector('img').id;
    if (e.throwDirection == Direction.RIGHT) {
      // movieId liked
      if (feedbackData.moviesDisliked.has(movieId)) {
        feedbackData.moviesDisliked.delete(movieId);
      }
      feedbackData.moviesLiked.add(movieId);
    } else {
      // movieId disliked
      if (feedbackData.moviesLiked.has(movieId)) {
        feedbackData.moviesLiked.delete(movieId);
      }
      feedbackData.moviesDisliked.add(movieId);
    }
    cards.add(stack.getCard(e.target));
  });

  stack.on('throwin', function (e) {
    const movieId = e.target.querySelector('img').id;
    if (e.throwDirection == Direction.RIGHT) {
      // movieId was liked
      feedbackData.moviesLiked.delete(movieId);
    } else {
      // movieId was disliked
      feedbackData.moviesDisliked.delete(movieId);
    }
    cards.add(stack.getCard(e.target));
  });
});
