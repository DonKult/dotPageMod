/* I have a HTTPSEverywhere rule to make rmv.de/auskunft use https,
   but the form contained in the page hardcodes http which firefox rightly
   warns about on send – as the rewrite to http will happen to late for this
   check, so fix up the URI to avoid triggering the warning */
forEach('form', httpform => httpform.action = httpform.action.replace(/^http:/, 'https:'));
