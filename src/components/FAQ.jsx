import { useState } from "react";
import PropTypes from "prop-types";
import plusIcon from "../assets/images/plus-icon.svg";

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div
    className="flex w-full cursor-pointer flex-row gap-2 border-b border-zinc-100 py-4"
    onClick={onClick}
  >
    <img
      src={plusIcon}
      className={`h-6 w-6 transform transition ${isOpen ? "rotate-45" : ""}`}
      alt=""
    />
    <div className="flex w-full flex-col">
      <h3 className="text-lg tracking-tight text-zinc-800">{question}</h3>
      {isOpen && <p className="mt-4 tracking-tight text-zinc-500">{answer}</p>}
    </div>
  </div>
);
FAQItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is Dwelli?",
      answer:
        "Dwelli is a property management platform that helps landlords manage their properties and renters find their next home.",
    },
    {
      question: "How can I list my property on Dwelli?",
      answer:
        "To list your property on Dwelli, you need to create an account. Once you have an account, you can list your property by providing the necessary details.",
    },
    {
      question: "What is the cost of using Dwelli?",
      answer:
        "Dwelli is free to use for renters. However, landlords will be charged a fee for using the platform.",
    },
    {
      question: "How can I contact Dwelli?",
      answer:
        "You can contact Dwelli by sending us a message through our contact form. We will get back to you as soon as possible.",
    },
  ];

  return (
    <div className="flex w-full flex-col items-center py-24">
      <h2 className="text-4xl tracking-tight text-zinc-800">
        Common Questions
      </h2>
      <p className="mt-4 w-5/6 text-center tracking-tight text-zinc-500">
        We aim to address the most common questions you may have. However, if
        you have any further inquiries, please don’t hesitate to send us a
        message
      </p>

      <div className="mt-8 w-5/6 sm:w-2/3">
        {faqItems.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>

      <p className="text-brand mt-8 text-sm tracking-tight">
        Have more questions? Send us an email
      </p>
    </div>
  );
}
