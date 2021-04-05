document.addEventListener("DOMContentLoaded", function () {
  var Direction = window.swing.Direction;

  const config = {
    minThrowOutDistance: window.innerWidth / 3,
    maxThrowOutDistance: window.innerWidth / 3 + 20,
    maxRotation: window.innerWidth / 200,
    allowedDirections: [Direction.LEFT, Direction.RIGHT],
  };

  let stack;
  stack = window.swing.Stack(config);

  [].forEach.call(document.querySelectorAll(".card"), function (targetElement) {
    stack.createCard(targetElement);
  });

  stack.on("throwout", function (e) {
    console.log(
      e.target.innerText || e.target.textContent,
      "has been thrown out of the stack to the",
      e.throwDirection,
      "direction."
    );
    const card = stack.getCard(e.target);
    console.log(card);
    // card.destroy();
  });

  stack.on("throwin", function (e) {
    console.log(
      e.target.innerText || e.target.textContent,
      "has been thrown into the stack from the",
      e.throwDirection,
      "direction."
    );
  });
});
