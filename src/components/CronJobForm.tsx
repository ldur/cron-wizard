import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CronJob } from "@/types/CronJob";
import { convertToCron, parseSchedule } from "@/utils/cronParser";
import { ScheduleGroup } from "@/services/scheduleGroupService";
import { useQuery } from "@tanstack/react-query";
import { fetchScheduleGroups } from "@/services/scheduleGroupService";

interface CronJobFormProps {
  onSubmit: (job: Omit<CronJob, 'id' | 'nextRun'>) => void;
  onCancel: () => void;
  job?: CronJob;
}

const CronJobForm = ({ onSubmit, onCancel, job }: CronJobFormProps) => {
  const [name, setName] = useState(job?.name || '');
  const [command, setCommand] = useState(job?.command || '');
  const [schedule, setSchedule] = useState(job?.cronExpression || '0 0 * * *');
  const [isApi, setIsApi] = useState(job?.isApi || false);
  const [endpointName, setEndpointName] = useState(job?.endpointName || '');
  const [activeTab, setActiveTab] = useState<"simple" | "advanced">("simple");
	const [groupId, setGroupId] = useState<string | null>(job?.groupId || null);

  const { data: scheduleGroups = [], isLoading, error } = useQuery({
    queryKey: ['scheduleGroups'],
    queryFn: fetchScheduleGroups,
  });

  useEffect(() => {
    if (job) {
      setName(job.name);
      setCommand(job.command);
      setSchedule(job.cronExpression);
      setIsApi(job.isApi);
      setEndpointName(job.endpointName || '');
			setGroupId(job.groupId || null);
    }
  }, [job]);

  const handleSubmit = () => {
    const newJob: Omit<CronJob, 'id' | 'nextRun'> = {
      name,
      command,
      cronExpression: schedule,
      status: 'active',
      isApi,
      endpointName: isApi ? endpointName : null,
      iacCode: null,
			groupId: groupId,
    };
    onSubmit(newJob);
  };

  const handleSimpleScheduleChange = (value: string) => {
    let cronExpression = '';
    switch (value) {
      case 'every_minute':
        cronExpression = '* * * * *';
        break;
      case 'every_5_minutes':
        cronExpression = '*/5 * * * *';
        break;
      case 'every_30_minutes':
        cronExpression = '*/30 * * * *';
        break;
      case 'hourly':
        cronExpression = '0 * * * *';
        break;
      case 'daily':
        cronExpression = '0 0 * * *';
        break;
      case 'weekly':
        cronExpression = '0 0 * * 0';
        break;
      case 'monthly':
        cronExpression = '0 0 1 * *';
        break;
      default:
        cronExpression = '0 0 * * *';
        break;
    }
    setSchedule(cronExpression);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="My Cron Job"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="command">Command</Label>
          <Input
            id="command"
            placeholder="echo 'Hello, world!'"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          />
        </div>
				<div className="space-y-2">
					<Label htmlFor="group">Group (Optional)</Label>
					<Select onValueChange={setGroupId} defaultValue={groupId || ""}>
						<SelectTrigger id="group">
							<SelectValue placeholder="Select a group" />
						</SelectTrigger>
						<SelectContent>
							{scheduleGroups.map((group) => (
								<SelectItem key={group.id} value={group.id}>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
      </div>

      <Tabs defaultValue="simple" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="space-y-2">
          <Label>Schedule</Label>
          <RadioGroup className="grid grid-cols-1 gap-2" onValueChange={handleSimpleScheduleChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="every_minute" id="every_minute" />
              <Label htmlFor="every_minute">Every minute</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="every_5_minutes" id="every_5_minutes" />
              <Label htmlFor="every_5_minutes">Every 5 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="every_30_minutes" id="every_30_minutes" />
              <Label htmlFor="every_30_minutes">Every 30 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly">Hourly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
          </RadioGroup>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="space-y-2">
            <Label htmlFor="schedule">Cron Expression</Label>
            <Textarea
              id="schedule"
              placeholder="0 0 * * *"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter a cron expression to define the schedule.{" "}
              <a
                href="https://crontab.guru/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Learn more
              </a>
              .
            </p>
            {schedule && (
              <div className="rounded-md border p-4">
                <p className="text-sm font-bold">Schedule Breakdown:</p>
                {parseSchedule(schedule).map((item, index) => (
                  <p key={index} className="text-sm">
                    <span className="font-bold">{item.label}:</span> {item.value}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center space-x-2">
        <Switch id="isApi" checked={isApi} onCheckedChange={setIsApi} />
        <Label htmlFor="isApi">Is API Endpoint?</Label>
      </div>

      {isApi && (
        <div className="space-y-2">
          <Label htmlFor="endpointName">Endpoint Name</Label>
          <Input
            id="endpointName"
            placeholder="my_api_endpoint"
            value={endpointName}
            onChange={(e) => setEndpointName(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
};

export default CronJobForm;
