import { AccordionContent, AccordionItem, AccordionTrigger, Accordion as RAccordion } from './shadcn/ui/accordion'

export default function Accordion() {
  return (
    <RAccordion type="single" collapsible className="w-[380px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it free?</AccordionTrigger>
        <AccordionContent>Yes. But you should Venmo me @Tim-Vanlerberg</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it ez?</AccordionTrigger>
        <AccordionContent>
          Yes. I got it running in React and TypeScript with utils for communicating with the extension's injection layer.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>This is so awesome</AccordionTrigger>
        <AccordionContent>Facts.</AccordionContent>
      </AccordionItem>
    </RAccordion>
  )
}
