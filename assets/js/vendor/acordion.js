// Get all the Accordions in the page
let accordions = document.querySelectorAll(".accordion");

Array.from(accordions).forEach((accordion) => {
  // Get all Accordion items for each Accordion
  items = accordion.querySelectorAll(".accordion-item");

  Array.from(items).forEach((item) => {
    // Set styles for all opened items
    if (item.classList.contains("open")) {
      item.querySelector("p").style.maxHeight =
        item.querySelector("p").scrollHeight + 60 + "px";
    }

    // Get all titles of accordion items
    let title = item.querySelector("h5");

    title.addEventListener("click", (e) => {
      // Get target element (title of accordion)
      let target = e.target;

      // Get the text section of the element
      let textbox = target.nextElementSibling;

      // Get parent element (accordion item)
      let parent = target.parentElement;

      // Toggle 'open' class of element
      parent.classList.toggle("open");

      // Set styles
      if (parent.classList.contains("open")) {
        textbox.style.maxHeight = textbox.scrollHeight + 100 + "px";
      } else {
        textbox.style.maxHeight = null;
      }

      // Get all sibling elements
      let siblingsElements = parent.parentElement.querySelectorAll(
        ".accordion-item"
      );

      // Close all other sibling items
      Array.from(siblingsElements).forEach((i) => {
        element = i.querySelector("h5");
        if (element != target) {
          element.nextElementSibling.style.maxHeight = null;
          element.parentElement.classList.remove("open");
        }
      });
    });
  });
});