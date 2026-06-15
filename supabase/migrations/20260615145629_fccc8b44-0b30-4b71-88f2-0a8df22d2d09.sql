CREATE OR REPLACE FUNCTION public.keep_alive()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
begin
  return 1;
end;
$function$;