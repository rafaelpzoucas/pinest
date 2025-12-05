"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateAdminStoreHours,
  useUpdateAdminStoreHours,
} from "@/features/admin/hours/hooks";
import { createStoreHoursSchema } from "@/features/admin/hours/schemas";
import { dayTranslation } from "@/lib/utils";
import { HourType } from "@/models/hour";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { hoursFormSchema } from "./schemas";

export type HoursFormValues = z.infer<typeof createStoreHoursSchema>;

export function BusinessHoursForm({ hours }: { hours?: HourType[] | null }) {
  const router = useRouter();
  const params = useParams();

  const isOnboarding = !!params.current_step;

  const [defaultTime, setDefaultTime] = useState({
    open_time: "09:00",
    close_time: "18:00",
  });

  const initialDays: HoursFormValues = {
    week_days: [
      {
        day_of_week: "sunday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "monday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "tuesday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "wednesday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "thursday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "friday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
      {
        day_of_week: "saturday",
        is_open: false,
        open_time: defaultTime.open_time,
        close_time: defaultTime.close_time,
      },
    ],
  };

  const transformedHours: HoursFormValues = {
    week_days:
      hours?.map((hour) => ({
        id: hour.id,
        created_at: hour.created_at,
        store_id: hour.store_id,
        day_of_week: hour.day_of_week,
        is_open: hour.is_open,
        open_time: hour.open_time,
        close_time: hour.close_time,
      })) ?? initialDays.week_days,
  };

  const form = useForm<HoursFormValues>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues: transformedHours,
  });

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "week_days",
  });

  const handleOpenTimeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTime = e.target.value;
    setDefaultTime((prev) => ({ ...prev, open_time: newTime }));
    form.setValue(`week_days.${index}.open_time`, newTime);
  };

  const handleCloseTimeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newTime = e.target.value;
    setDefaultTime((prev) => ({ ...prev, close_time: newTime }));
    form.setValue(`week_days.${index}.close_time`, newTime);
  };

  function goToNextStep() {
    if (isOnboarding) {
      router.push("/onboarding/store/socials");
    } else {
      router.back();
    }
  }

  const { mutate: createStoreHours, isPending: isCreatingStoreHours } =
    useCreateAdminStoreHours({
      onSuccess: () => {
        goToNextStep();
      },
    });

  const { mutate: updateStoreHours, isPending: isUpdatingStoreHours } =
    useUpdateAdminStoreHours({
      onSuccess: () => {
        goToNextStep();
      },
    });

  const isLoading = isCreatingStoreHours || isUpdatingStoreHours;

  async function onSubmit(values: HoursFormValues) {
    if (hours) {
      updateStoreHours(values);
    }

    createStoreHours(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6"
      >
        <div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative border-b last:border-b-0 py-4"
            >
              <Label className="text-lg capitalize">
                {dayTranslation[field.day_of_week as string]}{" "}
                <span className="text-sm text-muted-foreground">
                  (
                  {form.watch(`week_days.${index}.is_open`)
                    ? "aberto"
                    : "fechado"}
                  )
                </span>
              </Label>

              <FormField
                control={form.control}
                name={`week_days.${index}.is_open` as const}
                render={({ field }) => (
                  <FormItem className="absolute top-4 right-0 flex flex-row items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch(`week_days.${index}.is_open`) && (
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name={`week_days.${index}.open_time` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abre às</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) => handleOpenTimeChange(index, e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`week_days.${index}.close_time` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha às</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value}
                            onChange={(e) => handleCloseTimeChange(index, e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button type="submit" className="ml-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando horários
            </>
          ) : (
            "Salvar horários"
          )}
        </Button>
      </form>
    </Form>
  );
}
